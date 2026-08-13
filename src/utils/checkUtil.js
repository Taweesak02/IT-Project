const isAdmin = (userRole)=>{
    if (userRole !== 'admin') {
        throw new AppError('You do not have permission', 403);
    }
}

module.exports ={
    isAdmin
}