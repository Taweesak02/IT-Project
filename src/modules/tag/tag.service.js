const prisma = require('../../configs/db');
const AppError = require('../../utils/AppError');

const addTag = async(userRole,tagName)=>{
    isAdmin(userRole)

    const normalizedTagName = String(tagName ?? '').trim().toLowerCase();
    if (!normalizedTagName) {
        throw new AppError('Tag name is required', 400);
    }

    try{
        const createdTag = await prisma.tag.create({
            data:{
                name: normalizedTagName
            }
        })

        return { tag: createdTag };
    }catch(error){
        if (error.code === 'P2002') {
            throw new AppError('Tag already exists', 409);
        }
        throw error
    } 
}

const editTag = async(tagId,userRole,newTagName)=>{
    isAdmin(userRole)

    const parsedTagId = Number(tagId);
    if (Number.isNaN(parsedTagId)) {
        throw new AppError('Valid tagId is required', 400);
    }

    const normalizedTagName = String(newTagName ?? '').trim().toLowerCase();
    if (!normalizedTagName) {
        throw new AppError('Tag name is required', 400);
    }

    const existingTag = await prisma.tag.findUnique({ where: { id: parsedTagId } });
    if (!existingTag) {
        throw new AppError('Tag not found', 404);
    }

    try {
        const updatedTag = await prisma.tag.update({
            where: { id: parsedTagId },
            data: { name: normalizedTagName }
        });

        return { tag: updatedTag };
    } catch (error) {
        if (error.code === 'P2002') {
            throw new AppError('Tag already exists', 409);
        }
        throw error;
    }

    
}

const removeTag = async(tagId,userRole)=>{
    isAdmin(userRole)

    const parsedTagId = Number(tagId);
    if (Number.isNaN(parsedTagId)) {
        throw new AppError('Valid tagId is required', 400);
    }

    const existingTag = await prisma.tag.findUnique({ where: { id: parsedTagId } });
    if (!existingTag) {
        throw new AppError('Tag not found', 404);
    }

    await prisma.tag.delete({ where: { id: parsedTagId } });
    return { message: 'Tag deleted successfully' };
}

const getAllTags = async()=>{
    const tags = await prisma.tag.findMany({
        orderBy: { name: 'asc' }
    });

    return { tags };
}

const getTagById = async(tagId)=>{
    const parsedTagId = Number(tagId);
    if (Number.isNaN(parsedTagId)) {
        throw new AppError('Valid tagId is required', 400);
    }

    const tag = await prisma.tag.findUnique({ where: { id: parsedTagId } });
    if (!tag) {
        throw new AppError('Tag not found', 404);
    }

    return { tag };
}

const isAdmin = (userRole)=>{
    if (userRole !== 'admin') {
        throw new AppError('You do not have permission', 403);
    }
}


module.exports = {
    addTag,
    editTag,
    removeTag,
    getAllTags,
    getTagById
};