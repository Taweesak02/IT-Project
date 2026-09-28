jest.mock('../src/configs/db', () => ({
    paymentMethod: { findUnique: jest.fn() },
    paymentTransaction: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    coinPackage: { findUnique: jest.fn() },
    $transaction: jest.fn(),
}));

jest.mock('../src/modules/coinPackage/coinPackage.service', () => ({
    getOnePackage: jest.fn(),
}));

jest.mock('../src/modules/wallet/wallet.service', () => ({
    getWallet: jest.fn(),
    increaseWallet: jest.fn(),
}));

jest.mock('promptpay-qr', () => jest.fn(() => 'promptpay-payload'));
jest.mock('qrcode', () => ({ toDataURL: jest.fn() }));

const prisma = require('../src/configs/db');
const { getOnePackage } = require('../src/modules/coinPackage/coinPackage.service');
const { getWallet, increaseWallet } = require('../src/modules/wallet/wallet.service');
const QRCode = require('qrcode');
const payment = require('../src/modules/payment/payment.service');

beforeEach(() => jest.clearAllMocks());

test('purchases a package and returns a QR code', async () => {
    getOnePackage.mockResolvedValue({ id: 2, price: 120, coinAmount: 1200 });
    prisma.paymentMethod.findUnique.mockResolvedValue({ id: 3, isActive: true, promptPayId: '0812345678' });
    prisma.paymentTransaction.create.mockResolvedValue({ id: 8 });
    QRCode.toDataURL.mockResolvedValue('data:image/png;base64,qr');

    await expect(payment.purchasePackage(4, { packageId: 2, paymentMethodId: 3 })).resolves.toEqual({
        paymentTransactionId: 8,
        qrImage: 'data:image/png;base64,qr',
        amount: 120,
    });
    expect(prisma.paymentTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId: 4, amount: 120, paymentStatus: 'PENDING' }),
    });
});

test('rejects invalid payment methods and missing payment method ids', async () => {
    getOnePackage.mockResolvedValue({ id: 2, price: 120 });
    await expect(payment.purchasePackage(4, { packageId: 2 })).rejects.toMatchObject({ statusCode: 400 });
    prisma.paymentMethod.findUnique.mockResolvedValue(null);
    await expect(payment.purchasePackage(4, { packageId: 2, paymentMethodId: 3 })).rejects.toMatchObject({ statusCode: 400 });
    prisma.paymentMethod.findUnique.mockResolvedValue({ id: 3, isActive: false });
    await expect(payment.purchasePackage(4, { packageId: 2, paymentMethodId: 3 })).rejects.toMatchObject({ statusCode: 400 });
    prisma.paymentMethod.findUnique.mockResolvedValue({ id: 3, isActive: true, promptPayId: null });
    await expect(payment.purchasePackage(4, { packageId: 2, paymentMethodId: 3 })).rejects.toMatchObject({ statusCode: 400 });
});

test('returns payment status and history with ownership checks', async () => {
    await expect(payment.getPaymentStatus(0, 4, 'user')).rejects.toMatchObject({ statusCode: 400 });
    prisma.paymentTransaction.findUnique.mockResolvedValue(null);
    await expect(payment.getPaymentStatus(8, 4, 'user')).rejects.toMatchObject({ statusCode: 404 });
    prisma.paymentTransaction.findUnique.mockResolvedValue({ id: 8, userId: 9 });
    await expect(payment.getPaymentStatus(8, 4, 'user')).rejects.toMatchObject({ statusCode: 403 });
    const transaction = { id: 8, userId: 9, paymentStatus: 'PENDING' };
    prisma.paymentTransaction.findUnique.mockResolvedValue(transaction);
    await expect(payment.getPaymentStatus(8, 4, 'admin')).resolves.toBe(transaction);

    prisma.paymentTransaction.findMany.mockResolvedValue([{ id: 8 }]);
    await expect(payment.getPaymentHistory(4)).resolves.toEqual([{ id: 8 }]);
});

test('verifies a pending slip and credits the wallet', async () => {
    const transaction = { id: 8, userId: 4, paymentStatus: 'PENDING', coinPackageId: 2, amount: 120 };
    prisma.paymentTransaction.findUnique.mockResolvedValue(transaction);
    prisma.$transaction.mockImplementation(async (callback) => callback({
        paymentTransaction: { update: jest.fn().mockResolvedValue({ id: 8, paymentStatus: 'COMPLETED' }) },
        coinPackage: { findUnique: jest.fn().mockResolvedValue({ coinAmount: 1200 }) },
    }));
    getWallet.mockResolvedValue({ id: 6 });
    increaseWallet.mockResolvedValue({ id: 10 });

    await expect(payment.verifySlip(8, 4, { filename: 'slip.png' })).resolves.toEqual({
        payment: { id: 8, paymentStatus: 'COMPLETED' },
        coinTransaction: { id: 10 },
    });
    expect(increaseWallet).toHaveBeenCalledWith(6, 1200, expect.any(Object), expect.objectContaining({ transactionType: 'PURCHASE' }));
});

test('rejects invalid slip verification requests', async () => {
    prisma.paymentTransaction.findUnique.mockResolvedValue(null);
    await expect(payment.verifySlip(8, 4, { filename: 'slip.png' })).rejects.toMatchObject({ statusCode: 404 });
    prisma.paymentTransaction.findUnique.mockResolvedValue({ id: 8, userId: 9, paymentStatus: 'PENDING' });
    await expect(payment.verifySlip(8, 4, { filename: 'slip.png' })).rejects.toMatchObject({ statusCode: 403 });
    prisma.paymentTransaction.findUnique.mockResolvedValue({ id: 8, userId: 4, paymentStatus: 'COMPLETED' });
    await expect(payment.verifySlip(8, 4, { filename: 'slip.png' })).rejects.toMatchObject({ statusCode: 400 });
    prisma.paymentTransaction.findUnique.mockResolvedValue({ id: 8, userId: 4, paymentStatus: 'PENDING' });
    await expect(payment.verifySlip(8, 4)).rejects.toMatchObject({ statusCode: 400 });
});

test('cancels only the owner pending payment', async () => {
    prisma.paymentTransaction.findUnique.mockResolvedValue(null);
    await expect(payment.cancelPayment(8, 4)).rejects.toMatchObject({ statusCode: 404 });
    prisma.paymentTransaction.findUnique.mockResolvedValue({ id: 8, userId: 9, paymentStatus: 'PENDING' });
    await expect(payment.cancelPayment(8, 4)).rejects.toMatchObject({ statusCode: 403 });
    prisma.paymentTransaction.findUnique.mockResolvedValue({ id: 8, userId: 4, paymentStatus: 'COMPLETED' });
    await expect(payment.cancelPayment(8, 4)).rejects.toMatchObject({ statusCode: 400 });
    prisma.paymentTransaction.findUnique.mockResolvedValue({ id: 8, userId: 4, paymentStatus: 'PENDING' });
    prisma.paymentTransaction.update.mockResolvedValue({ id: 8, paymentStatus: 'FAILED' });
    await expect(payment.cancelPayment(8, 4)).resolves.toEqual({ id: 8, paymentStatus: 'FAILED' });
});