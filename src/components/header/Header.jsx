import './Header.css'

export default function Header() {
    return (
        <div class="main header">
            <div class="logo">
                <img src="/download.jpeg" alt="The Echo Community Logo, TEC logo"></img>
            </div>
            <div class="navlinks">
                <a href="#">Certificates</a>
                <a href="#">About</a>
                <a href="#">Projects</a>
                <a href="#">Partners</a>
                <a href="/member">Members</a>
            </div>

            <div class="cta"><a href="#">Join Us</a></div>
        </div>
    )
}