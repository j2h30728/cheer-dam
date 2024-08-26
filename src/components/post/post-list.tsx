import { InitialPosts } from "@/service/postService";
import ListPost from "./list-post";

export default function PostList({ initialPosts }: { initialPosts: InitialPosts["items"] }) {
  if (initialPosts.length === 0)
    return <div className="mx-auto py-10 text-xl text-base">인증글이 존재하지 않습니다.</div>;
  return (
    <div className="flex flex-col gap-4">
      {initialPosts.map((post, i) => (
        <ListPost key={post.id} {...post} />
      ))}
    </div>
  );
}
