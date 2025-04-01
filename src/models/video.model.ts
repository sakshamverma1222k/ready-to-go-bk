import mongoose, { Schema, Document } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define the interface for the video document
interface IVideo extends Document {
    title: string;
    description: string;
    thumbnail: string;
    videoFile: string;
    duration: number;
    views: number;
    isPublished: boolean;
    owner: mongoose.Types.ObjectId; // Reference to the User model
    // tags: string[]; // Uncomment if tags are used
    // likesCount: number;
    // dislikesCount: number;
}

// Define the video schema
const videoSchema: Schema<IVideo> = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        videoFile: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Uncomment and modify the following fields if necessary
        // tags: [{
        //     type: String,
        //     required: true
        // }],
        // likesCount: {
        //     type: Number,
        //     default: 0
        // },
        // dislikesCount: {
        //     type: Number,
        //     default: 0
        // }
    },
    { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

// Create the model using the interface
const Video = mongoose.model<IVideo>("Video", videoSchema);

export default Video;
