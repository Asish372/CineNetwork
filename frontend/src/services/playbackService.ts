import api from './api';

class PlaybackService {
  private positions: Record<string, number> = {};

  async savePosition(id: string, position: number) {
    this.positions[id] = position;
    try {
      console.log(`Sending POST /content/progress with id=${id}, progress=${position}`);
      const response = await api.post('/content/progress', { contentId: id, progress: position });
      console.log(`Saved position for ${id}: ${position} to backend. Status: ${response.status}`);
    } catch (error) {
      console.error('Failed to save position to backend:', error);
    }
  }

  getPosition(id: string): number {
    return this.positions[id] || 0;
  }

  async syncWithBackend() {
    try {
      const response = await api.get('/content/continue-watching');
      const history = response.data;
      history.forEach((item: any) => {
        if (item.Content && item.Content.id) {
            this.positions[item.Content.id.toString()] = item.progress;
        }
      });
      console.log('Synced playback positions from backend');
      return history;
    } catch (error) {
      console.error('Failed to sync playback positions:', error);
      return [];
    }
  }
}

export default new PlaybackService();
