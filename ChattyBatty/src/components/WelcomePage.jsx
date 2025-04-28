import { BigHeader } from '@/components/common'

const WelcomePage = ({ onClick }) =>
{
    return(
        <div className="hero bg-base-200 min-h-screen">
        <div className="mockup-window bg-base-100 border border-base-300">
        <div className="hero-content flex-col lg:flex-row">
          <img
            src="https://media.istockphoto.com/id/902453536/vector/smartphones.jpg?s=612x612&w=0&k=20&c=UtxmytEjTRCelaCH1lYx4UXJinAlpeisQiGIu_lNzwM="
            className="max-w-sm rounded-lg shadow-2xl"
          />
          <div>
            <h1 className="text-5xl font-bold">Welcome to ChattyBatty!</h1>
            <p className="py-6">
             Talk with friends and stuff
            </p>
            <button className="btn btn-primary" onClick={onClick}>Login</button>
          </div>
        </div>
        </div>
      </div>
    )
}

export default WelcomePage