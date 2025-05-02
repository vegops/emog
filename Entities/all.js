// Entities/all.js

export const GameState = {
    _state: null,
  
    async create({
      creature_name,
      task_type,
      success_count = 0,
      target_count = 3,
      initial_emoji_count = 15,
      is_completed = false,
      available_messages = 1,
      mood_level = 8,
      total_blobs = 1,
      wrong_emoji_count = 0,
      isGPT = false 
    }) {
      if (!creature_name || !task_type) {
        throw new Error("Missing required fields: creature_name or task_type");
      }
  
      this._state = {
        id: Date.now(),
        creature_name,
        task_type,
        success_count,
        target_count,
        initial_emoji_count,
        is_completed,
        available_messages,
        mood_level,
        total_blobs,
        wrong_emoji_count,
        isGPT  
      };
  
      return this._state;
    },
  
    async update(id, changes) {
      if (!this._state || this._state.id !== id) {
        throw new Error("No matching game state found to update");
      }
  
      this._state = {
        ...this._state,
        ...changes
      };
  
      return true;
    },
  
    get() {
      return this._state;
    }
  };
  