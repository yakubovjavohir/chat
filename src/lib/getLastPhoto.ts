interface Photo {
  type: 'img';
  content: string | any;
  createAt: number;
}

export function getLastPhoto(attachments: any[]): Photo | null {
  if (!attachments?.length) return null;

  const lastAtt = attachments[attachments.length - 1]; // oxirgi attachment

  return {
    type: 'img',
    content: lastAtt,
    createAt: lastAtt.createAt ? new Date(lastAtt.createAt).getTime() : Date.now()
  };
}
