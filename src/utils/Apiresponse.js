class ApiResponse{
    constructor(statusCode,data,message="success")
    {
        this.statusCode=statusCode;
        this.data=data;
        this.message=message;
        this.success=statusCode<400; // above 400 is error we wil send that using the seperate error class  
    }
}
module.exports=ApiResponse
// success property is for the frontend it would be set to true if the status code is 
//less than 200 .