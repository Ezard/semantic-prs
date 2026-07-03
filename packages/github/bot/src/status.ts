export type Status = {
  sha: string;
  state: 'error' | 'failure' | 'pending' | 'success';
  target_url: string;
  description: string;
  context: string;
};
