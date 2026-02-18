import {cache} from "react";

type Messages = Record<string, any>;

const loadAllMessages = cache(async (locale: string): Promise<Messages> => {
  const messagesModule = await import(`../messages/${locale}.json`);
  return messagesModule.default;
});

export const loadMessages = cache(
  async (locale: string, namespaces: string[]): Promise<Messages> => {
    const all = await loadAllMessages(locale);
    const filtered: Messages = {};

    for (const namespace of namespaces) {
      if (all[namespace]) {
        filtered[namespace] = all[namespace];
      }
    }

    return filtered;
  },
);

