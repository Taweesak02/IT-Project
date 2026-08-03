const formatChapterContent = (chapter) => ({
    id: chapter.id,
    title: chapter.title,
    chapterNumber: chapter.chapterNumber,
    pages: chapter.pages
});

module.exports = {
    formatChapterContent
};