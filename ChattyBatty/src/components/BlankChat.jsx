import Logo from './Logo'

const BlankChat = () => {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col justify-center items-center flex-1">
        <Logo size={200} colour="currentColor"/>
        <p className="text-4xl text-base-300 font-semibold mt-4 ">ChattyBatty</p>
      </div>
    </div>
  )
}

export default BlankChat
