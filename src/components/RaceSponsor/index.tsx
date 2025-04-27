// hooks
import useLocalStorage from "hooks/useLocalStorage";

// styles
import "./styles.css";

export const RACE_SPONSOR_NAME_KEY = "raceSponsorName";
export const RACE_SPONSOR_LOGO_KEY = "raceSponsorLogo";

export const RaceSponsor = () => {
    const [raceSponsorName, setRaceSponsorName] = useLocalStorage(RACE_SPONSOR_NAME_KEY, "");
    const [raceSponsorLogo, setRaceSponsorLogo] = useLocalStorage(RACE_SPONSOR_LOGO_KEY, "");

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setRaceSponsorName(encodeURIComponent(event.target.value));
    };

    const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        if (event.target.files?.length) {
            const file = event.target.files[0];

            const reader = new FileReader();
            reader.onloadend = async () => {
                const regex = new RegExp(/^.+base64,(.*)/);

                const formData = new FormData();
                formData.append("image", (reader.result as string).match(regex)?.[1] as string);
                formData.append("name", file.name);

                // TODO: Really shouldn't have API keys public!
                const response = await fetch("https://api.imgbb.com/1/upload?key=e92e777ed6272d23354fa127633309d3", {
                    method: "POST",
                    body: formData,
                });

                if (response.status === 200) {
                    response.json().then(responseData => {
                        setRaceSponsorLogo(responseData.data.url);
                    })
                }
            }
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="raceSponsor">
            <h2>Race Sponsor</h2>

            <input type="string" onChange={onNameChange} value={decodeURIComponent(raceSponsorName)} placeholder="Sponsor Name" />
            <input type="file" onChange={onImageChange} />
            {!!raceSponsorLogo && <img src={raceSponsorLogo} style={{maxWidth: 100}}/>}
        </div>
    );
};