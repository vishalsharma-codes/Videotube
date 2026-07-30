import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist

    if(!name||!description){
        throw new ApiError(
            400,"All fields are required"
        )
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user._id
    });

    return res
    .status(200)
    .json(new ApiResponse(
        200,playlist,"Playlist created successfully"
    ))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)){
        throw new ApiError(
            400,"Invalid UserID"
        )
    }

    const playlists = await Playlist.aggregate([
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
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        },{
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline: [
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
        },{
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }
    ]);

    if(playlists.length===0){
        throw new ApiError(
            400,"UserID does not contain any playlist"
        )
    }    

    return res
    .status(200)
    .json(new ApiResponse(
        200,playlists,"Playlist fetched successfully"
    ))    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)){
    throw new ApiError(
        400,"Invalid PlaylistID"
    )
    }

    const playlist = await Playlist.aggregate([
    {
        $match: {
            _id: new mongoose.Types.ObjectId(playlistId)
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]            
        }
    },
    {
        $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
                pipeline: [
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
    },{
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
]);

    if (playlist.length === 0) {
        throw new ApiError(
            404,"Playlist does not exist for this id"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,playlist[0],"Playlist fetched successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId)||
        !isValidObjectId(videoId)){
    throw new ApiError(
        400,"Invalid ID"
    )}

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{
                videos:videoId
            }
        },{
            new:true
        }
    )

    if (!playlist) {
    throw new ApiError(404, "Playlist not found");
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,playlist,"Video added to playlist successfully"
        )
    ) 
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId)||
        !isValidObjectId(videoId)){
    throw new ApiError(
        400,"Invalid ID"
    )}


    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoId
            }
        },{
            new:true
        }
    )    

    if (!playlist) {
    throw new ApiError(404, "Playlist not found");
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,playlist,"Video removed from playlist successfully"
        )
    ) 
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!isValidObjectId(playlistId)){
    throw new ApiError(
    400,"Invalid PlaylistID"
    )}

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
    throw new ApiError(404, "Playlist not found");
    }

    if(playlist.owner.toString()!== req.user._id.toString()){
        throw new ApiError(
            404,"Unauthorized request"
        )
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,{},"Playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!isValidObjectId(playlistId)){
    throw new ApiError(
    400,"Invalid PlaylistID"
    )} 
    
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
    throw new ApiError(404, "Playlist not found");
    }   
    
    if(playlist.owner.toString()!== req.user._id.toString()){
        throw new ApiError(
            404,"Unauthorized request"
        )
    }

    if(!name?.trim()||!description?.trim()){
        throw new ApiError(
            400,"All fields are required"
        )
    }

    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }
        },{
            new:true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,updatedPlaylist,"Playlist updated"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}