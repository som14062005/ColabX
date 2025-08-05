export class SignupDto {
  username: string;
  displayName: string;
  email: string;
  password: string;
  skills?: string[];
  github?: string;
  bio: string;
}
