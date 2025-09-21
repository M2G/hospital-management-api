import * as bcrypt from 'bcrypt';

function encryptPassword(password: string): string {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

function comparePassword(password: string, encodedPassword: string): boolean {
  return bcrypt.compareSync(password, encodedPassword);
}

function validatePassword(endcodedPassword: string): (password: string) => boolean {
  return function (password: string) {
    return comparePassword(password, endcodedPassword);
  };
}

export { encryptPassword, validatePassword };
