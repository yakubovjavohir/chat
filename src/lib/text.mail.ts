export function extractUserContent(rawText: string): { text: string; images: string[] } {
  if (!rawText) return { text: '', images: [] };

  const images: string[] = [];

  // 1. [image: filename] dan rasm nomlarini yig'ib olish
  const imageRegex = /\[image:\s*([^\]]+)\]/g;
  let match;
  while ((match = imageRegex.exec(rawText)) !== null) {
    images.push(match[1].trim());
  }

  // 2. Matndan image bloklarini olib tashlash
  let cleaned = rawText.replace(imageRegex, '');

  // 3. HTML quote (>...) va forwarded (>...) qismlarini o‘chirish
  cleaned = cleaned.replace(/(^>.*\n?)+/gm, '');

  // 4. "вт, 29 июл. ..." yoki shunga o‘xshash pastdan forwarded bloklarni kesib tashlash
  const forwardedIndex = cleaned.search(/^\s*(пн|вт|ср|чт|пт|сб|вс),/im);
  if (forwardedIndex !== -1) {
    cleaned = cleaned.slice(0, forwardedIndex);
  }

  // 5. Oxiridagi >>>>>> yoki ________ chiziqli replylarni olib tashlash
  cleaned = cleaned
    .split('\n')
    .filter(line => !/^>{2,}|^[-_=]{3,}/.test(line.trim()))
    .join('\n');

  // 6. Faqat yuqoridagi matn blokini olish (boshida bo‘sh qatorgacha bo‘lgan qism)
  const blocks = cleaned.trim().split(/\n\s*\n/);
  const firstBlock = blocks[0]?.trim() || '';

  return {
    text: firstBlock,
    images,
  };
}
