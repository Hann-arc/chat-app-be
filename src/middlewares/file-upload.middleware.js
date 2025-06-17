import mullter from 'multer';

const storage = mullter.memoryStorage()

const upload = mullter({storage});

export default upload