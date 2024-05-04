
const asyncHandler=(fn)=>{return async(req,res,next)=>{
    
    try {
        await fn(req,res,next);
    } catch (error) {
        res.status(error.code || 500).json({
            success:false,
            messsage:error.messsage
        })
    }
}
}

module.exports= asyncHandler;

// at's the core benefit of using asyncHandler in your Express routes.
//  By using it, you can avoid writing repetitive try...catch blocks and async/await syntax in every route handler.



