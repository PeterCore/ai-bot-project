import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 标记此路由为公开(不需要验证token)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
