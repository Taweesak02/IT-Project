const fs = require('fs/promises');
const path = require('path');
const AppError = require('../../utils/AppError');

const UPLOAD_ROOT = path.join(__dirname, '../../public/uploads');

const toPublicUrl = (file) => {
    return `/uploads/${file.filename}`;
};

const saveCover = async (file) => {
    if (!file) {
        throw new AppError('Cover image is required', 400);
    }
    return { url: toPublicUrl(file) };
};

const saveAvatar = async (file) => {
    if (!file) {
        throw new AppError('Avatar image is required', 400);
    }
    return { url: toPublicUrl(file) };
};

const saveChapterPages = async (files) => {
    const normalizedFiles = Array.isArray(files) ? files : files ? [files] : [];

    if (normalizedFiles.length === 0) {
        throw new AppError('At least one page image is required', 400);
    }

    // preserve upload order as page order — frontend should upload in reading order
    return normalizedFiles.map((file, index) => ({
        pageNumber: index + 1,
        url: toPublicUrl(file)
    }));
};

const deleteFileByUrl = async (publicUrl) => {
    if (!publicUrl){ 
        throw new AppError('url is required', 400);
    }

    const filename = path.basename(publicUrl);
    const filePath = path.join(UPLOAD_ROOT, filename);

    try {
        await fs.unlink(filePath);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            console.error('Failed to delete file:', filePath, err);
        }
    }
};

module.exports = {
    saveCover,
    saveAvatar,
    saveChapterPages,
    deleteFileByUrl
};