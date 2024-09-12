import dotenv from "dotenv";

dotenv.config();

const {
  LMS_USERNAME,
  LMS_PASSWORD,
  MAX_DOWNLOAD_TRY,
  MAX_UPLOAD_TRY,
  MAX_DOWNLOAD_TIME,
  MONGODB_URI,
} = process.env;

if (!LMS_USERNAME || !LMS_PASSWORD || !MONGODB_URI) {
  throw new Error("Missing required environment variables.");
}

const env = {
  LMS_USERNAME,
  LMS_PASSWORD,
  MAX_DOWNLOAD_TRY: MAX_DOWNLOAD_TRY || 3,
  MAX_UPLOAD_TRY: MAX_UPLOAD_TRY || 3,
  MAX_DOWNLOAD_TIME: MAX_DOWNLOAD_TIME || 20000,
  MONGODB_URI,
  BASE_URL: "http://lms.ui.ac.ir",
  LOGIN_URL: "http://lms.ui.ac.ir/login",
  HOME_URL: "http://lms.ui.ac.ir/members/home",
  INBOX_URL: "http://lms.ui.ac.ir/messages/inbox",
};

export default env;
