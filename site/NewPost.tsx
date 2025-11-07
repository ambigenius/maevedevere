interface SoundPost extends BasePost {
  type: 'Sound';
  text: string;
  image: string | string[] | null;
  imageWidth: string;
  audioUrl: string | null;
}
