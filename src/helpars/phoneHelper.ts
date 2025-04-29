
const formatPhoneNumber = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, ''); // Remove all non-digit characters
    let formattedPhone: string;
  
    if (digitsOnly.startsWith('880')) {
      // If the phone number starts with 880 (Bangladeshi country code), keep it as is
      formattedPhone = digitsOnly;
    } else if (digitsOnly.startsWith('0')) {
      // If the phone number starts with 0 (local format), prepend with 880
      formattedPhone = `880${digitsOnly.substring(1)}`;
    } else if (digitsOnly.startsWith('+880')) {
      // If the phone number starts with +880, remove the leading plus sign
      formattedPhone = digitsOnly.substring(1);
    } else {
      // Throw an error if the phone number is in an invalid format
      throw new Error('Invalid Bangladeshi phone number format. Use 01... or +8801...');
    }
  
    return formattedPhone;
  };
  
  export default formatPhoneNumber;
  