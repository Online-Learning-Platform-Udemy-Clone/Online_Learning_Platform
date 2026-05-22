import {Schema,model,Types} from 'mongoose';

const reviewSchema=new Schema({
    student:{
        type: Types.ObjectId,
        ref:"user",
        required:[true,"User ID is Required"]
    },
    rating:{
        type: Number,
        min:[1,"Rating should be atleast 1"],
        max:[5,"Rating should be atmost 5"],
        required: [true,"Rating is Required"]
    },
    comment:{
        type:String,
        required:[true,"Enter Comment"]
    },
},
{
    versionKey:false,
    timestamps:true,
    strict:"throw"
});

const chapterSchema=new Schema({
    textContent:{
        type: String,
        required: [true,"Text Content is Required"],
        minLength: [30,"Content should be at least 10 Characters"]
    },
    videoContent:
    {
        type: String
    }
},
{
    versionKey:false,
    timestamps:true,
    strict:"throw"
})
;

const courseSchema=new Schema({
    instructor:
    {
        type: Types.ObjectId,
        ref: "user",
        required: [true,"Instructor ID is Required"]
    },
    title:{
        type: String,
        required: [true,"Title is Required"],
    },
    category:{
        type: String,
        required: [true,"Category is required"],
    },
    price:{
        type: Number,
        default:0
    },
    content:{
        type: String,
        required: [true,"Content is Required"]
    },
    chapters: [{type: chapterSchema,default:[]}],
    reviews: [{type: reviewSchema,default:[]}],

    isCourseActive:{
        type: Boolean,
        default: true
    }
},{
    versionKey: false,
    timestamps: true,
    strict: "throw"
})

//Create Course Model
export const CourseModel=model("course",courseSchema);