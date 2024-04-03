// const asyncHandler=()=>{}
const asyncHandlr=(fn)=>{()=>{}}
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