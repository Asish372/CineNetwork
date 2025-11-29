class PlaybackService {
  private positions: Record<string, number> = {};

  savePosition(id: string, position: number) {
    this.positions[id] = position;
  }

  getPosition(id: string): number {
    return this.positions[id] || 0;
  }
}

export default new PlaybackService();
