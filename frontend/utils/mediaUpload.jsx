import { createClient } from "@supabase/supabase-js";

const anon_key =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZnVnYWlyd21hc2JqaGZycG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NDA2MDcsImV4cCI6MjA1ODExNjYwN30.ecznuddDaKxmOV7FgoSYr5Z7WxdCOmQ7gFoxL3ZhgEU";
const supabase_url = "https://sqfugairwmasbjhfrpnk.supabase.co";

const supabase = createClient(supabase_url, anon_key);

export default function mediaUpload(file) {
	return new Promise((resolve, reject) => {
        if(file == null){
            reject("No file selected")
        }

		const timestamp = new Date().getTime();
		const fileName = timestamp + file.name;

		supabase.storage
			.from("images")
			.upload(fileName, file, {
				cacheControl: "3600",
				upsert: false,
			})
			.then(() => {
				const publicUrl = supabase.storage.from("images").getPublicUrl(fileName)
					.data.publicUrl;
				resolve(publicUrl);
			}).catch(()=>{
                reject("Error uploading file")
            })
	});
}
