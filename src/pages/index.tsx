import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import { Header } from "~/components/Header";
import { NoteEditor } from "~/components/NoteEditor";
import { type RouterOutputs, api } from "~/utils/api";

const Home: NextPage = () => {
	return (
		<>
			<Head>
				<title>Create T3 App</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className=" min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
				<Header />
				<Content />
			</main>
		</>
	);
};

export default Home;

type Topic = RouterOutputs["topic"]["getAll"][0];

const Content: React.FC = () => {
	const { data: sessionData } = useSession();
	const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
	const { data: topics, refetch: refetchTopics } = api.topic.getAll.useQuery(
		undefined,
		{
			enabled: sessionData?.user !== undefined,
			onSuccess: (data) => {
				setSelectedTopic(selectedTopic ?? data[0] ?? null);
			},
		},
	);

	const createTopic = api.topic.create.useMutation({
		onSuccess: () => {
			void refetchTopics();
		},
	});

	const { data: notes, refetch: refetchNotes } = api.note.getAll.useQuery(
		{
			topicId: selectedTopic?.id ?? "",
		},
		{
			enabled: sessionData?.user !== undefined && selectedTopic !== null,
		},
	);

	const createNote = api.note.create.useMutation({
		onSuccess: () => {
			void refetchNotes();
		},
	});

	return (
		<div className="mx-5 mt-5 grid grid-cols-4 gap-2">
			<div className="px-2">
				<ul className="menu rounded-box w-56 p-2 bg-base-100">
					{topics?.map((topic) => (
						<li key={topic.id}>
							<Link
								href="#"
								onClick={(evt) => {
									evt.preventDefault();
									setSelectedTopic(topic);
								}}
							>
								{topic.title}
							</Link>
						</li>
					))}
				</ul>
				<div className="divider"></div>
				<input
					type="text"
					placeholder="New Topic"
					className="input-bordered input-sm input w-full"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							createTopic.mutate({
								title: e.currentTarget.value,
							});
							e.currentTarget.value = "";
						}
					}}
				/>
			</div>
			<div className="col-span-3">
				<NoteEditor
					onSave={({ title, content }) => {
						void createNote.mutate({
							title,
							content,
							topicId: selectedTopic?.id ?? "",
						});
					}}
				/>
			</div>
		</div>
	);
};
