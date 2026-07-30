import mongoose ,{isValidObjectId}from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video Id does not exist")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video does not exist")
    }

    const comments = await Comment.aggregate([
    {
        $match: {
            video: new mongoose.Types.ObjectId(videoId)
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
        $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "video",
            pipeline: [
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
                {
                    $project: {
                        title: 1,
                        thumbnail: 1,
                        duration: 1,
                        views: 1,
                        owner: 1
                    }
                }
            ]
        }
    },
    {
        $addFields: {
            owner: {
                $first: "$owner"
            },
            video: {
                $first: "$video"
            }
        }
    },
    {
        $sort: {
            createdAt: -1
        }
    },
    {
        $skip: (Number(page) - 1) * Number(limit)
    },
    {
        $limit: Number(limit)
    }
]);
   
    return res
    .status(200)
    .json(new ApiResponse(200,comments,"comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video Id is invalid")
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video does not exist")
    }

    if(!content?.trim()){
        throw new ApiError(400,"Content not found")
    }

    const comment = await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201,comment,"Comment added Successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const {content} = req.body
    const {commentId} = req.params

    if(!content||!content?.trim()){
        throw new ApiError(400,"Content does not found")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Comment does not exist")
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(400,"comment does not found")
    }

    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,"Unauthorized request")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedComment,"Comment Updated Successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(
            400,"Comment does not exist"
        )
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(
            400,"Comment does not exist"
        )
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"unauthorized Request")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }