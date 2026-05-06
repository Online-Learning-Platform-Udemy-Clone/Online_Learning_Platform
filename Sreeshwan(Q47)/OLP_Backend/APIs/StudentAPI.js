import exp from 'express';
import { UserModel } from '../Models/UserModel.js';
import { verifyToken } from '../Middlewares/VerifyToken.js';
import { EnrollmentModel } from '../Models/EnrollmentModel.js';
import { CourseModel } from '../Models/CourseModel.js';
import { PaymentModel } from '../Models/PaymentModel.js';


export const studentApp=exp.Router();

//Protected Student Route to get All Courses
studentApp.get("/courses",verifyToken("STUDENT"),async(req,res)=>{
    //read all courses
    const courseList=await CourseModel.find({isCourseActive: true});
    //send res
    res.status(200).json({message: "All Courses",payload: courseList})
})

//Protected Student Route to pay for Course to Pay
studentApp.post("/pay",verifyToken("STUDENT"),async(req,res)=>{
    //get paymentobj from client
    const paymentObj=req.body
    console.log(req.body);

    //get user from token
    let user=req.user
    console.log(user)

    //check if instructor exists
    let student=await UserModel.findOne({email: user.email});
    console.log(student)

    if(!student){
        return res.status(404).json({message:"Invalid Student! Student does not exist"})
    }

    if(student.email!==user.email){
        return res.status(403).json({message:"You are not the Authorized Student"})
    }
    
    //check role
    if(student.role!="STUDENT"){
        return res.status(403).json({message:"Only Student can do Payment"})
    }

    if(!paymentObj.course||!paymentObj.student||!paymentObj.amount||!paymentObj.method||!paymentObj.transactionId)
    {
        return res.status(400).json({message:"Payment Details Missing"})
    }

    if(paymentObj.status!="PENDING" || !paymentObj.status!="FAILED")
    {
        return res.status(400).json({message:"Payment is not Complete"})
    }

    //create course document
    const newPaymentDoc=new PaymentModel(paymentObj)

    //save document into database
    await newPaymentDoc.save()
    //res
    res.status(201).json({message:"Payment Completed Successfully"})
})

//Protected Student Route to Enroll in a Course
studentApp.post("/enroll",verifyToken("STUDENT"),async(req,res)=>{
    //get courseId from body
    const enrollObj=req.body;

    //req user
    const user=req.user;

    //check user
    let student=await UserModel.findById(enrollObj.student);

    //check if the student exist
    if(!student)
    {
        return res.status(404).json({message:"Invalid Student"})
    }

    //check if it is the same student who has logged in and trying to enroll in course
    if(student.email!=user.email)
    {
        return res.status(404).json({message:"You are not the authorized author"})
    }

    //create enrollment document
    const enrollmentDoc=new EnrollmentModel(enrollObj);

    //save the article document
    await enrollmentDoc.save();

    //send res to author
    res.status(201).json({message:"Enrollment Successful"})
})

//Protected Student Route to View All Courses which he enrolled
studentApp.get("/course",verifyToken("STUDENT"),async(req,res)=>{
    //req user
    const studentId=req.user?.id;

    //read all the courses which the student enrolled in
    const studentCourseList=await EnrollmentModel.find({student:studentId});
    //send res
    res.status(200).json({message: "All Courses",payload: studentCourseList})
})

//Protected Student Route to Drop a Course which he enrolled
studentApp.patch("/course",verifyToken("STUDENT"),async(req,res)=>{
    //req courseId and Status from req.body
    const {courseId,status}=req.body;
    console.log(req.body);
    //get user id from token
    const studentId=req.user?.id;
    console.log(studentId);

    //get enrollment tuple from Enrollment DB
    const enrollmentOfDb=await EnrollmentModel.findOne({student:studentId,course:courseId})

    //check if enrollment data of student and course exist
    if(!enrollmentOfDb)
    {
        //Return user not found
        return res.status(403).json({message:"Enrollment details of Student with the Given Course not Found"})
    }

    if(status===enrollmentOfDb.status)
    {
        return res.status(200).json({message:"Enrollment already in the same state"})
    }

    //Update status property to Dropped
    enrollmentOfDb.status=status;
    await enrollmentOfDb.save();
    //send res
    res.status(200).json({message: "Dropped Enrollment Details",payload: enrollmentOfDb})
})

//Protected Route to Add Review to Course
studentApp.put("/course",verifyToken("STUDENT"),async(req,res)=>{
    //get body from req
    const {courseId,rating,comment}=req.body;

    //check course
    const courseDocument=await CourseModel.findOne({_id:courseId,isCourseActive:true}).populate("reviews.student");

    //if course not Found
    if(!courseDocument)
    {
        return res.status(404).json({message:"Course not Found"});
    }

    //get student id from token
    const studentIdOfToken=req.user?.id;

    //comment validation
    if(!comment||comment.trim()==="")
    {
        return res.status(400).json({message:"Comment cannot be Empty"})
    }

    //add comment to comment arrays of course document
    courseDocument.reviews.push({student:studentIdOfToken,rating: rating,comment:comment})

    //save
    await courseDocument.save();

    //get updated course document
    const updatedCourse=await CourseModel.findById(courseId).populate("reviews.student");

    //send res
    res.status(200).json({message:"Comment Added Successfully",payload:updatedCourse})
})




export default studentApp;