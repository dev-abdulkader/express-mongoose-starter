import ApiError from '../../../errors/ApiErrors';
import httpStatus from 'http-status';
import Contact from './contact.model';
import User from '../User/user.model';


const createContact = async (payload: any) => {
  const { providerId, message } = payload;

  if (!message) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Message field is required');
  }

  if (!providerId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Provider ID is required');
  }

  // ✅ Check if provider exists and has correct role
  const provider = await User.findOne({ _id: providerId, role: 'SERVICE_PROVIDER' });

  if (!provider) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No service provider found with the given ID');
  }

  const contact = await Contact.create(payload);
  return contact;
};

export const ContactService = {
  createContact,
};
