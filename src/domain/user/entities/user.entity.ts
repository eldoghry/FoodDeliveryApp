import { v4 as uuidV4 } from "uuid";
import moment from "moment";

// TODO: user Base Entity that hold common attributes like createdAt
export class User {
  private _id: string;
  private _name: string;
  private _email: string;
  private _password: string;
  private _dob: Date;
  private _status: "active" | "inactive" = "active";
  private _createdAt: Date;

  constructor(name: string, email: string, password: string, dob: Date) {
    this._id = uuidV4();
    this._name = name;
    this._createdAt = new Date();
    this._email = email;
    this._password = password; //TODO: hash
    this._dob = dob;
  }

  get email() {
    return this._email;
  }

  get age() {
    return moment().diff(moment(this._dob), "years");
  }

  // TODO: add more logic
}
