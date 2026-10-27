export interface BacklogItem {
  id: string;
  title: string;
}

export interface Story {
  id: string;
  title: string;
  backlogItemId: string;
}
