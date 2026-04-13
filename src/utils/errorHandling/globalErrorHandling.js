export const globalErrorHandler = (error,req,res,next)=>{
    const status = error.status || 500;

    res.status(status).json({
        success:false,
        message:error.message,
        stack:error.stack,
    });
};