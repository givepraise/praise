import axios, { AxiosRequestConfig } from 'axios';
import { ApiException } from 'src/shared/exceptions/api-exception';
import { errorMessages } from 'src/shared/exceptions/error-messages';
import fs from 'fs';
import FormData from 'form-data';

const JWT_TOKEN = process.env.PINATA_JWT_TOKEN;

/**
 * Uploads a file to IPFS via Pinata
 * @param file
 * @returns {Promise<string>}
 */
export const uploadToIpfs = async (
  file: Express.Multer.File,
): Promise<string> => {
  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(file.path);
    formData.append('file', fileStream);

    const metadata = JSON.stringify({
      name: file.originalname,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': `multipart/form-data`,
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
    };

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      config,
    );

    return response.data.IpfsHash;
  } catch (error) {
    throw new ApiException(errorMessages.IPFS_UPLOAD_ERROR);
  }
};

/**
 * Deletes a file from IPFS via Pinata
 * @param ipfsHash
 * @returns {Promise<void>}
 * @throws {ApiException}
 **/
export const deleteFromIpfs = async (ipfsHash: string): Promise<void> => {
  try {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
    };

    return await axios.delete(
      `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
      config,
    );
  } catch (error) {
    throw new ApiException(errorMessages.IPFS_DELETE_ERROR);
  }
};
