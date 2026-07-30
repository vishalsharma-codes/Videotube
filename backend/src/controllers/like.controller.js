import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(
            400,"Invalid videoId"
        )
    }

    const alreadyLiked = await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked._id);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, {},"Video disliked successfully"
        )
    )
    }

    const like = await Like.create({
        video:videoId,
        likedBy:req.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, like,"Video liked successfully"
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(
            400,"Invalid commentId"
        )
    }

    const alreadyLiked = await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked._id);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, {},"comment disliked successfully"
        )
    )
    }

    const like = await Like.create({
        comment:commentId,
        likedBy:req.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, like,"comment liked successfully"
        )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(
            400,"Invalid tweetId"
        )
    }

    const alreadyLiked = await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked._id);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, {},"tweet disliked successfully"
        )
    )
    }

    const like = await Like.create({
        tweet:tweetId,
        likedBy:req.user._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, like,"tweet liked successfully"
        )
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user._id),
                video:{$exists:true}
            }
        },{
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[{
                    $project:{
                        title:1,
                        owner:1,
                        thumbnail:1,
                        duration:1,
                        views:1
                    }
                }]
            }
        },{
            $addFields:{
                video:{
                    $first:"$video"
                }
            }
        },{
            $lookup:{
                from:"users",
                localField:"video.owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[{
                    $project:{
                        username:1,
                        fullName:1,
                        avatar:1
                    }
                }]
            }
        },
            {
            $addFields:{
                "video.owner":{
                    $first:"$owner"
                }
            }
        },{
            $project:{
                _id:0,
                video:1
            }
        }
])

    if(!likedVideos.length){
        throw new ApiError(
            404,"Liked Videos are not available"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,likedVideos,"Liked Videos fetched successfully"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}