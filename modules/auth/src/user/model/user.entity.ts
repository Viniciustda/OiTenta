import {
  BcryptHashRule,
  EmailRule,
  Entity,
  EntityState,
  MaxLengthRule,
  MinLengthRule,
  PersonNameRule,
  RequiredRule,
  TimezoneRule,
  Validator,
} from "@oitenta/shared";

export interface UserState extends EntityState {
  name: string;
  email: string;
  password: string;
  timezone: string;
}

export class User extends Entity<UserState> {
  constructor(props: UserState) {
    super(props);
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get timezone(): string {
    return this.props.timezone;
  }

  public validate(): void {
    Validator.validate([
      {
        code: "user.name",
        value: this.name,
        rules: [
          new RequiredRule(),
          new MinLengthRule(3),
          new MaxLengthRule(80),
          new PersonNameRule(),
        ],
      },
      {
        code: "user.email",
        value: this.email,
        rules: [new RequiredRule(), new EmailRule()],
      },
      {
        code: "user.password",
        value: this.password,
        rules: [new RequiredRule(), new BcryptHashRule()],
      },
      {
        code: "user.timezone",
        value: this.timezone,
        rules: [new RequiredRule(), new TimezoneRule()],
      },
    ]);
  }
}
