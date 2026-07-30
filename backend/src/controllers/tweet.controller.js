import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const{content} = req.body

    if(!content||!content?.trim()){
        throw new ApiError(
            400,"Content not found"
        )
    }

    const tweet = await Tweet.create({
        content,
        owner:req.user._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,tweet,"tweet created successfully🎉🎉"
        ))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(userId)){
        throw new ApiError(
            400, "Invalid userId"
        )
    }

    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(
            404, "User does not exist"
        )
    }

    const userTweets = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },{
            $lookup:{
                from:"users",
                localField:"owner",
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
        },{
            $addFields:{
                owner:{
                    $first:"$owner"
                },
            }
            },{
                $project: {
                    content: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    owner: 1
                }
            },{
            $sort:
            {
                createdAt:-1
            }
        },{
            $skip:(Number(page) -1)*Number(limit)
        },{
            $limit:Number(limit)
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse 
        (200,userTweets,"Tweets by user are fetched")
    )            

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(
            400,"Invalid tweet Id"
        )
    }

    if(!content||!content?.trim()){
        throw new ApiError(
            400,"Tweet Content is not available"
        )
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(
            404,"Tweet is not available"
        )
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(
            403,"Unauthorized request"
        )
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,updatedTweet,"Tweet updated successfully"
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
    throw new ApiError(
        400,"Tweet Id is Invalid"
    )
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(
            404,"Tweet is not available"
        )
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(
            403,"Unauthorized request"
        )
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,{},"Tweet deleted successfully"
        )
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}