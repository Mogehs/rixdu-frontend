// Function to get the right icon for social links
const getSocialIcon = (name) => {
  switch (name.toLowerCase()) {
    case 'facebook':
      return 'facebookIcon';
    case 'twitter':
      return 'twitterIcon';
    case 'linkedin':
      return 'linkedinIcon';
    case 'instagram':
      return 'instagramIcon';
    case 'youtube':
      return 'youtubeIcon';
    default:
      return '';
  }
};

export { getSocialIcon };
