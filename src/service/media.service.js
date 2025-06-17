import cloudinary from "../libs/cloudinary.js";

export const uploadToCloudinary = async (file) => {
    const base46 = file.buffer.toString('base64');

    const dataURI = `data:${file.mimetype};base64,${base46}`;

    const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "ChatApp"
    })

    return cloudinaryResponse.secure_url
}

export const deleteFromCloudinary = async (url) => {
    await cloudinary.uploader.destroy(url)
}