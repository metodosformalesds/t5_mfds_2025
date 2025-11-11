export function CardEjemplo({username, name, isFollowing}) {
    const imgSrc = "https://tse2.mm.bing.net/th/id/OIP.VhKD4nzRJfpfw1TNHOEPQgHaHa?cb=ucfimgc2&rs=1&pid=ImgDetMain&o=7&rm=3/${username}";
    return(
        <article className='card-twitter'>
        <header className='card-header'>
            <img className='card-twitter-img' src={imgSrc} alt="" />
            <div className='card-twitter-info'>
            <strong>{name}</strong>
            <span className='card-twitter-infoUsername'>{username}</span>
            </div>
        </header>

        <aside>
            <button className='card-twitter-button'>Seguir</button>
        </aside>
        </article>
        
    )
    
}