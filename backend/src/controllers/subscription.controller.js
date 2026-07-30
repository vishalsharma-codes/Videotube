import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)){
        throw new ApiError(
            400,"invalid channelId"
        )
    }

    const subscriberId = req.user?._id;

    if(subscriberId.toString() === channelId){
        throw new ApiError(
            400,"You can not subscribe your own channel"
        )
    }

    const isSubscribed = await Subscription.findOne({
        subscriber:subscriberId,
        channel:channelId
    })

    if(isSubscribed){
        await Subscription.findByIdAndDelete(isSubscribed._id);

        return res
        .status(200)
        .json(
            new ApiResponse(
                200 ,{},"Unsubscribed successfully"
            )
        )
    }
    const subscription = await Subscription.create({
        subscriber:subscriberId,
        channel:channelId
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, subscription, "Subscribed successfully"
        )
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(
            400,"invalid channelId"
        )
    }

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },{
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriberDetails",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        },{
        $unwind: "$subscriberDetails"
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(
        200, subscribers , "all subscibers list"
    ))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
  
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(
            400,"invalid subscriberId"
        )
    }

    const channels = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },{
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channelDetails",
                pipeline:[{
                    $project:{
                        _id:1,
                        username:1,
                        fullName:1,
                        avatar:1
                    }
                }]
            }
        },{
            $unwind:"$channelDetails"
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(
        200,channels,"All channels list"
    ))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}