const cloudinary=require('cloudinary').v2;
import * as dotenv from 'dotenv';
dotenv.config({path: '../.env'});
console.log('Cloudinary URL:', process.env.CL_URL);
cloudinary.config({
    cloud_name:process.env.CL_CLOUD_NAME,
    api_key:process.env.CL_KEY,
    api_secret:process.env.CL_SECRET,
    secure:true,
});
cloudinary.uploader
.upload("../docs/story.pdf",{
    resource_type:"raw",
    name:"sample.pdf"
    
})
.then((result:any)=>{
    console.log(result);
})

