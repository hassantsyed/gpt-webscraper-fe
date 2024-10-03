import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { uid, sid } = req.body;

  if (!uid || !sid) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const response = await fetch(process.env.SCRAPE_EP!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, sid }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error calling parse endpoint:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
