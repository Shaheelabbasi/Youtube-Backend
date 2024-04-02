class Apiresponse{
    constructor(statusCode,data,message)
    {
        this.statusCode=statusCode;
        this.data=data;
        this.message=message;
        this.success=statusCode<400; // above 400 is error we wil send that using the seperate error class  
    }
}