import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user._id

    const totalVideos = await Video?.countDocuments({
        owner:channelId
    })

    const totalSubscribers = await Subscription.countDocuments({
        channel:channelId
    })

    const totalViewResult = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },{
            $group:{
                _id:null,
                totalViews:{
                    $sum:"$views"
                }
            }
        }
    ])

    const totalViews = totalViewResult.length>0?totalViewResult[0].totalViews:0;

    const totalLikeResult = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },{
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },{
            $group:{
                _id:null,
                totalLikes:{
                    $sum:{
                        $size:"$likes"
                    }
                }
            }
        }
    ])

    const totalLikes = totalLikeResult.length>0?totalLikeResult[0].totalLikes:0

    return res
    .status(200)
    .json(new ApiResponse(
        200,{
            totalVideos,
            totalSubscribers,
            totalViews,
            totalLikes
        },
        "Channel Stats fetched successfully"
    ))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.user._id;

    const videos = await Video
    .find({
        owner:channelId
    })
    .sort({
        createdAt:-1
    })
    .select("title thumbnail views duration isPublished createdAt")

    return res
    .status(200)
    .json(new ApiResponse(
        200, videos, "Videos uploaded at this channel"
    ))

})

export {
    getChannelStats, 
    getChannelVideos
    }