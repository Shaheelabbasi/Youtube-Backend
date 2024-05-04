class Apierror extends Error
{
    constructor(  statuscode, message="something went wrong", errors=[], stack=""  )
    {
        //here the variables for the class are created as well as assinged values 
        super(message)
        this.statuscode=statuscode;
        this.message=message;
        this.data=null;
        this.errors=errors;
        this.success=false;
        if(stack)
        {
            this.stack=stack;
//             When an error occurs, the stack property captures the call stack at that point in time.
// Examining the stack trace allows you to pinpoint the exact line of code where the error originated.
        }
        else
        {
            Error.captureStackTrace(this,this.constructor);
        }
    }
}
module.exports=Apierror;

// Limited Inheritance: In JavaScript, the super call within a constructor primarily serves to initialize inherited methods and properties defined in the parent class. Since the Error class constructor traditionally only accepts a message, passing other arguments wouldn't make sense in this context.
// Error Class Behavior: The Error class likely handles properties like the status code or error details internally. It might have its own logic for assigning these values or capturing the call stack. Passing them explicitly to super wouldn't be part of the standard behavior.
// By calling super(message), you make your user-defined class (ApiError) a true subclass of the Error class. 
// This enables it to leverage the built-in functionalities and properties of Error,
//  making it a more robust and versatile error handling tool in your JavaScript application