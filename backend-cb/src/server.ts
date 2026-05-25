import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`CreatorBoost API running on http://localhost:${PORT}`);
});
