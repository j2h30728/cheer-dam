import { z } from "zod";

import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX, USERNAME_MIN_LENGTH } from "@/constants/validate";
import { checkEmailAvailability, isEmailExists, checkUsernameAvailability, isUsernameExists } from "./server/validate";
import { isCategory } from "./utils";

export const accountSchema = z
  .object({
    email: z
      .string({
        required_error: "이메일은 필수 값입니다.",
      })
      .trim()
      .email("이메일 형식으로 작성해주세요."),
    username: z
      .string({
        invalid_type_error: "이름은 문자만 가능합니다.",
        required_error: "이름은 필수 값입니다.",
      })
      .trim()
      .min(USERNAME_MIN_LENGTH, "이름은 2글자 이상이어야 합니다."),
    password: z
      .string({
        required_error: "비밀번호는 필수 값입니다.",
      })
      .min(PASSWORD_MIN_LENGTH, "비밀번호는 8글자 이상이어야 합니다.")
      .regex(PASSWORD_REGEX, "반드시 1개 이상의 숫자를 포함해야 합니다."),
    confirm_password: z
      .string({
        required_error: "비밀번호는 필수 값입니다.",
      })
      .min(PASSWORD_MIN_LENGTH, "비밀번호는 8글자 이상이어야 합니다."),
  })
  .superRefine(({ password, confirm_password }, ctx) => {
    if (password !== confirm_password) {
      ctx.addIssue({
        code: "custom",
        message: "비밀번호 동일하지 않습니다.",
        path: ["confirm_password"],
      });
    }
  })
  .superRefine(async ({ email }, ctx) => {
    if (await isEmailExists(email)) {
      ctx.addIssue({
        code: "custom",
        message: "이미 존재하는 이메일입니다.",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .superRefine(async ({ username }, ctx) => {
    if (await isUsernameExists(username)) {
      ctx.addIssue({
        code: "custom",
        message: "이미 존재하는 이름입니다.",
        path: ["username"],
        fatal: true,
      });
      return z.NEVER;
    }
  });

export const logInSchema = z.object({
  email: z
    .string({
      required_error: "이메일은 필수 값입니다.",
    })
    .trim()
    .email("이메일 형식으로 작성해주세요.")
    .refine(isEmailExists, "존재하지않는 유저입니다."),
  password: z.string({
    required_error: "비밀번호는 필수 값입니다.",
  }),
});

export const postSchema = z.object({
  photo: z
    .string({
      required_error: "이미지는 필수 값입니다.",
    })
    .trim()
    .min(1, "이미지는 빈 값이 될 수 없습니다."),
  description: z
    .string({
      required_error: "자세한 설명은 필수 값입니다.",
    })
    .trim()
    .min(1, "자세한 설명은 빈 값이 될 수 없습니다."),
  category: z.string().refine(isCategory, "잘못된 주제선택입니다."),
});

export const commentSchema = z
  .string({
    required_error: "코멘트 내용은 필수 값입니다.",
  })
  .trim()
  .min(1, "코멘트는 빈 값이 될 수 없습니다.")
  .max(200, "코멘트는 최대 200자 입니다.");

export const keywordSchema = z
  .string({
    required_error: "검색어는 필수 값입니다.",
  })
  .trim()
  .min(1, "검색어는 빈 값이 될 수 없습니다.")
  .max(20, "검색어는 최대 20자 입니다.");

export const profileSchema = z
  .object({
    email: z
      .string({
        required_error: "이메일은 필수 값입니다.",
      })
      .trim()
      .email("이메일 형식으로 작성해주세요."),
    username: z
      .string({
        invalid_type_error: "이름은 문자만 가능합니다.",
        required_error: "이름은 필수 값입니다.",
      })
      .trim()
      .min(USERNAME_MIN_LENGTH, "이름은 2글자 이상이어야 합니다."),
    password: z.string({
      required_error: "비밀번호는 필수 값입니다.",
    }),
    newPassword: z
      .string()
      .optional()
      .refine((value) => !value || (value.length >= PASSWORD_MIN_LENGTH && PASSWORD_REGEX.test(value)), {
        message: "비밀번호는 8글자 이상이어야 하며, 1개 이상의 숫자를 포함해야 합니다.",
      }),
    bio: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || value.length <= 200, {
        message: "소개글은 200글자 이하이어야 합니다.",
      }),
    photo: z.string().optional(),
  })
  .superRefine(async ({ email }, ctx) => {
    const isEmailAvailable = await checkEmailAvailability(email);
    if (!isEmailAvailable) {
      ctx.addIssue({
        code: "custom",
        message: "이미 존재하는 이메일입니다.",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .superRefine(async ({ username }, ctx) => {
    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
      ctx.addIssue({
        code: "custom",
        message: "이미 존재하는 이름입니다.",
        path: ["username"],
        fatal: true,
      });
      return z.NEVER;
    }
  });

export type CreateAccountType = z.infer<typeof accountSchema>;
export type LogInType = z.infer<typeof logInSchema>;
export type UploadPostType = z.infer<typeof postSchema>;
export type ProfileType = z.infer<typeof profileSchema>;
