import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {upload} from "../middlewares/multer.middleware.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1, 
        limit = 10, 
        query, 
        sortBy = "createdAt", 
        sortType = "asc", 
        userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)

    const filter={}

    if(query){
        filter.$or=[
            {
                title:{
                    $regex:query,
                    $options:"i"
                }
            },{
                description:{
                    $regex:query,
                    $options:"i"
                }
            }
        ]
    }

    if(userId){
        if(!isValidObjectId(userId)){
            throw new ApiError(400,"User does not exist")
        }

        filter.owner = userId;
    }

    const sort={}
    sort[sortBy] = sortType === "desc"?-1:1;

    const skip = (pageNumber-1)*limitNumber;

    const videos = await Video.aggregate([
        {
            $match:filter
        },{
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                 pipeline: [
                {
                    $project: {
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }]
        }},
         {
        $addFields: {
            owner: {
                $first: "$owner"
            }
        }
    },
    {
        $sort: sort
    },
    {
        $skip: skip
    },
    {
        $limit: limitNumber
    }
    ])
    if (!videos.length) {
    throw new ApiError(404, "Video not found");
    }

    const totalVideos = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalVideos / limitNumber)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                videos,
                page:pageNumber,
                limit:limitNumber,
                totalVideos,
                totalPages
            },
            "Videos fetched successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title || !description){
        throw new ApiError(400,"Title or Description is missing")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoFileLocalPath){
        throw new ApiError(
            400,"Video File is required"
        )
    }

    if(!thumbnailLocalPath){
        throw new ApiError(
            400,"Thumbnail file is required"
        )
    }

    const video = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!video){
        throw new ApiError(
            400,"video upload failed"
        )
    };

    if(!thumbnail){
        throw new ApiError(
            400,"thumbnail upload failed!!!"
        )
    }

    const createdVideo = await Video.create({
        title,
        description,
        videoFile:video.url,
        thumbnail:thumbnail.url,
        duration:video.duration,
        owner:req.user._id
    })

    if(!createdVideo){
        throw new ApiError(400,"video upload unsuccessfull")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,createdVideo,"Video Uploaded Successfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },

        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },

        // Get all likes of this video
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },

        // Add like count
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                }
            }
        },

        // Check if current user liked this video
        {
            $addFields: {
                isLiked: {
                    $in: [
                        req.user._id,
                        "$likes.likedBy"
                    ]
                }
            }
        },

        // Remove likes array from response
        {
            $project: {
                likes: 0
            }
        }
    ]);

    if (!video.length) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video[0],
                "Video found successfully"
            )
        );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const{title,description} = req.body
    //TODO: update video details like title, description, thumbnail

    if(!isValidObjectId(videoId)){
        throw new ApiError(
            400, "Invalid videoId"
        )
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(
            404,"Video not found"
        )
    }

    if
    (video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(
            403,"unauthorized request"
        )
    }

        if(!title||!description){
        throw new ApiError(
            400,"All feilds are required"
        )
    }

    const thumbnailFile = req.file?.path;

    // if(!thumbnailFile){
    // throw new ApiError(
    //     400,"Thumbnail not found"
    // )
    // }

    let thumbnailFileUrl;

    if(thumbnailFile){
    thumbnailFileUrl = await uploadOnCloudinary(thumbnailFile)

    if(!thumbnailFileUrl){
        throw new ApiError(
            500,"Thumbnail upload failed"
        )
    }}

    const updateFields ={
        title,
        description
    }

    if(thumbnailFileUrl){
        updateFields.thumbnail = thumbnailFileUrl.url;
    }


    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:updateFields
        },
        {new:true}
    )
return res
.status(200)
.json(
    new ApiResponse(
        200, updatedVideo,"Video feilds updated successfully"
    )
)
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }

    const video = await Video.findById(videoId);

    if (!video) {
    throw new ApiError(404, "Video not found");
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"unauthorized request")
    }

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new ApiResponse(
        200,{},"Video deleted successfully"
    ))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
    throw new ApiError(400,"Invalid videoId")
    }

    const video = await Video.findById(videoId);

    if (!video) {
    throw new ApiError(404, "Video not found");
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"unauthorized request")
    }

    video.isPublished = !video.isPublished

    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,video,"Publish status updated successfully"
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}