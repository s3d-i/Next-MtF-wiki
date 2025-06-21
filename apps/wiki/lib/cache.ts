type CacheKey = string;
type CacheValue = any;

/**
 * 将参数序列化为缓存键
 * @param args 函数参数
 * @returns 序列化后的缓存键
 */
export function serializeArgs(args: any[]): CacheKey {
  try {
    return JSON.stringify(args, (key, value) => {
      // 处理特殊类型
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      if (value instanceof Map) {
        return { __type: 'Map', value: Array.from(value.entries()) };
      }
      if (value instanceof Set) {
        return { __type: 'Set', value: Array.from(value) };
      }
      return value;
    });
  } catch (error) {
    // 如果序列化失败，生成一个基于参数数量和类型的简单键
    console.error('serializeArgs error: ', error);
    return args.map((arg, index) => `${index}:${typeof arg}`).join('|');
  }
}

/**
 * 缓存函数，用于缓存函数调用结果
 * @param fn 要缓存的函数
 * @returns 包装后的缓存函数
 */
export function cache<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
): (...args: TArgs) => TReturn {
  const cacheStore = new Map<CacheKey, CacheValue>();

  return (...args: TArgs): TReturn => {
    // 生成缓存键
    const argsKey = serializeArgs(Array.from(args));
    const cacheKey = argsKey;

    // 检查缓存
    if (cacheStore.has(cacheKey)) {
      return cacheStore.get(cacheKey);
    }

    // 执行函数并缓存结果
    const result = fn(...args);

    // 如果结果是 Promise，需要特殊处理
    if (result instanceof Promise) {
      const cachedPromise = result.catch((error) => {
        // 如果 Promise 被拒绝，从缓存中移除以允许重试
        cacheStore.delete(cacheKey);
        throw error;
      });
      cacheStore.set(cacheKey, cachedPromise);
      return cachedPromise as TReturn;
    }

    // 缓存同步结果
    cacheStore.set(cacheKey, result);
    return result;
  };
}
